---
name: tenways-odoo-elk-diagnostics
description: Use this as the standard Tenways Odoo ELK/APM investigation template. Trigger when diagnosing production/UAT server incidents, WMS duplicate sends, cron/API/XML-RPC anomalies, database serialization conflicts, slow requests, or when judging whether code changes match observed log/APM evidence.
---

# Tenways Odoo ELK/APM Investigation Template

Use this skill as a reusable investigation standard, not as a stored incident report. Always derive the conclusion from the current server data, then connect it to the current code branch.

For WMS, stock, delivery carrier, approval, tracking, or cancellation logic, also use `tenways-odoo-stock`.

## Environment

- ELK stack path: `/home/rick/elk`
- Elasticsearch: `http://127.0.0.1:9200`
- Kibana: `http://127.0.0.1:5601`
- Runtime log indices: `odoo-runtime-*`
- APM trace data streams: `.ds-traces-apm-default-*`
- Use `curl --noproxy '*'` for local Elasticsearch.

Do not print secrets, tokens, or full PII-heavy payloads unless explicitly required. Summarize with identifiers, timestamps, logger, transaction name, model/table, and error type.

## Decision Matrix

Use runtime logs for "what happened":

- Provider request payloads and responses
- Business identifiers such as picking/order/tracking numbers
- Cron start/end/error lines
- Python exceptions and SQL error text
- Whether an external request was emitted once or multiple times

Use APM for "what overlapped":

- HTTP endpoint or cron transaction name
- Transaction timing and duration
- SQL spans inside each transaction
- Which endpoint touched the contended model/table
- Slow requests and N+1 patterns

Use code only after evidence exists:

- Search local repo with `rg`.
- Read the exact branch under investigation.
- Confirm method paths, transaction boundaries, cron behavior, and retry behavior.

When logs show `could not serialize access due to concurrent update`, use runtime logs to anchor the time, then use APM to identify overlapping transactions with SQL spans on the same table.

## Investigation Standard

1. Define the investigation scope.
   - Record environment, DB name, affected identifiers, user-facing symptom, and rough time range.
   - Convert user-provided local time to UTC before querying Elasticsearch.
   - If the user only gives identifiers, start with exact identifier searches.

2. Build the runtime log timeline.
   - Query exact identifiers with `match_phrase`.
   - Sort ascending by `@timestamp`.
   - Pull minimal fields: `@timestamp`, `message`, `log.logger`, `log.level`, `odoo.dbname`, `error.type`, `error.message`.
   - Count observed business events before making code assumptions.

3. Narrow the incident window.
   - Use the first event or first error as the anchor.
   - Query a small window around the anchor, usually 1 to 5 minutes.
   - Include cron loggers, integration/provider loggers, `odoo.sql_db`, and relevant error text.

4. Inspect APM when concurrency or latency matters.
   - Query transactions in the same narrow window.
   - Exclude websocket, image, assets, mail polling, and other known noise.
   - Expand the suspicious `trace.id` to spans.
   - Filter spans by table/model name, SQL verb, and known IDs when available.

5. Map evidence to code.
   - Search method names, model names, cron names, controller routes, and logger strings.
   - Verify the real write path and transaction boundary.
   - Identify whether external side effects happen before or after durable DB state changes.

6. Judge the fix.
   - A valid fix must break the exact failure sequence proven by logs/APM.
   - Check idempotency, locking, retry behavior, transaction boundaries, and rollback behavior.
   - Separate "helps one path" from "fully closes the observed bug."

## Query Templates

Replace all placeholders before running. Keep queries narrow and increase size/window only when evidence requires it.

### Runtime Log By Identifier

```bash
curl --noproxy '*' -s -H 'Content-Type: application/json' \
  -X POST 'http://127.0.0.1:9200/odoo-runtime-*/_search?pretty&filter_path=hits.total.value,hits.hits._source' \
  -d '{
    "size": 50,
    "sort": [{"@timestamp": "asc"}],
    "_source": [
      "@timestamp",
      "message",
      "log.logger",
      "log.level",
      "odoo.dbname",
      "odoo.request_path",
      "error.type",
      "error.message"
    ],
    "query": {
      "bool": {
        "filter": [
          {"term": {"odoo.dbname": "<DB_NAME>"}}
        ],
        "must": [
          {"match_phrase": {"message": "<IDENTIFIER>"}}
        ]
      }
    }
  }'
```

### Runtime Log By Incident Window

```bash
curl --noproxy '*' -s -H 'Content-Type: application/json' \
  -X POST 'http://127.0.0.1:9200/odoo-runtime-*/_search?pretty&filter_path=hits.total.value,hits.hits._source' \
  -d '{
    "size": 120,
    "sort": [{"@timestamp": "asc"}],
    "_source": ["@timestamp", "message", "log.logger", "log.level", "error.type", "error.message"],
    "query": {
      "bool": {
        "filter": [
          {"term": {"odoo.dbname": "<DB_NAME>"}},
          {"range": {"@timestamp": {"gte": "<START_UTC>", "lte": "<END_UTC>"}}}
        ],
        "should": [
          {"match_phrase": {"message": "<IDENTIFIER_OR_ERROR_TEXT>"}},
          {"term": {"log.logger": "<LOGGER_NAME>"}},
          {"term": {"log.logger": "odoo.sql_db"}},
          {"term": {"log.logger": "odoo.addons.base.models.ir_cron"}}
        ],
        "minimum_should_match": 1
      }
    }
  }'
```

### APM Transactions In Window

```bash
curl --noproxy '*' -s -H 'Content-Type: application/json' \
  -X POST 'http://127.0.0.1:9200/.ds-traces-apm-default-*/_search?pretty&filter_path=hits.total.value,hits.hits._source' \
  -d '{
    "size": 80,
    "sort": [{"@timestamp": "asc"}],
    "_source": [
      "@timestamp",
      "transaction.name",
      "transaction.duration.us",
      "event.outcome",
      "trace.id",
      "transaction.id",
      "labels.http_method",
      "labels.odoo_dbname"
    ],
    "query": {
      "bool": {
        "filter": [
          {"range": {"@timestamp": {"gte": "<START_UTC>", "lte": "<END_UTC>"}}},
          {"term": {"processor.event": "transaction"}},
          {"term": {"labels.odoo_dbname": "<DB_NAME>"}}
        ],
        "must_not": [
          {"wildcard": {"transaction.name": "POST /websocket*"}},
          {"wildcard": {"transaction.name": "GET /web/image*"}},
          {"wildcard": {"transaction.name": "GET /web/assets*"}},
          {"wildcard": {"transaction.name": "POST /mail/thread/data*"}},
          {"wildcard": {"transaction.name": "POST /web/dataset/call_kw/access.management*"}}
        ]
      }
    }
  }'
```

### APM SQL Spans For Trace

```bash
TRACE_ID='<TRACE_ID>'

curl --noproxy '*' -s -H 'Content-Type: application/json' \
  -X POST 'http://127.0.0.1:9200/.ds-traces-apm-default-*/_search' \
  -d "{
    \"size\": 500,
    \"sort\": [{\"@timestamp\": \"asc\"}],
    \"_source\": [\"@timestamp\", \"processor.event\", \"transaction.name\", \"span.name\", \"span.db.statement\", \"trace.id\", \"transaction.id\"],
    \"query\": {\"term\": {\"trace.id\": \"$TRACE_ID\"}}
  }" \
| jq -r '.hits.hits[]._source
  | select(.processor.event=="span")
  | select((.span.db.statement // "") | test("<TABLE_OR_MODEL>|UPDATE|INSERT|DELETE|<KNOWN_ID>"; "i"))
  | [."@timestamp", .span.name, ((.span.db.statement // "") | gsub("[\\n\\r\\t ]+"; " ") | .[0:400])] | @tsv'
```

## Analysis Rules

- Treat log lines as evidence of emitted events, not always final business success.
- Treat APM spans as transaction evidence; parameterized SQL may hide exact IDs.
- Distinguish observed facts, inferred causality, and unproven assumptions.
- If an external request is logged before a later DB error, consider rollback-after-side-effect risk.
- If multiple transactions write the same model/table in the same narrow window, check isolation/locking/retry semantics before blaming cron overlap.
- Do not judge a code fix from the diff alone; map it to the server-observed failure sequence.

## Output Template

Use this structure in the final response unless the user asks for a different format:

```markdown
**结论**
一句话说明最可能原因，以及确定性等级。

**证据**
- 时间线：UTC 时间；必要时补本地时间。
- runtime log 证明了什么。
- APM 证明了什么。
- 代码路径证明了什么。

**事务/并发判断**
说明哪些事务重叠、写了哪些表、是否存在 rollback/retry/side effect 风险。

**修复判断**
说明当前代码是否覆盖真实故障链路；如果不覆盖，缺口在哪里。

**建议**
列出下一步验证或代码改动，按风险优先级排序。
```

## 中文规范

这个 skill 是日志排查模板，不记录某一次事故的结论。每次排查都按同一个规范执行：

1. 先定义问题：哪个环境、哪个库、哪些单号、用户看到什么、时间范围是什么。
2. 先看 runtime log：确认业务事件是否发生、发生几次、错误原文是什么。
3. 再看 APM：只有在需要判断并发、慢请求、事务重叠时才查 trace/span。
4. 再回代码：用日志和 APM 找到的 method、route、logger、table 去 `rg`，不要先凭经验猜。
5. 最后判断修复：修复必须能打断日志/APM 证明的真实故障链路。

判断口径：

- “日志证明”：只写日志直接显示的事实。
- “APM 证明”：只写 trace/span 直接显示的并发、耗时、SQL。
- “代码推断”：明确说明是基于当前分支代码和证据链推断。
- “未证明”：没有日志/APM 支撑的点不要当结论写。
