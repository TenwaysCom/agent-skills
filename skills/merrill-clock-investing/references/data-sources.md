# Data Sources

Use this file only when building a current Merrill Clock view.

## Preferred Sources

- Global: IMF World Economic Outlook, OECD Economic Outlook, World Bank, S&P Global PMI releases.
- United States: BEA GDP, BLS CPI/PPI/jobs, Federal Reserve FOMC statements, Treasury yields, S&P Global US PMI.
- China: National Bureau of Statistics GDP/CPI/PPI/PMI, PBOC policy updates, Caixin/S&P Global PMI.
- India: MoSPI CPI/GDP/IIP, RBI policy statements, HSBC/S&P Global India PMI.
- Japan: Cabinet Office GDP, Statistics Bureau CPI, Bank of Japan statements, au Jibun Bank/S&P Global PMI.
- Euro area/Europe: Eurostat GDP/HICP/unemployment, ECB statements, HCOB/S&P Global PMI.

## Search Patterns

- `site:bea.gov GDP first estimate latest quarter United States`
- `site:bls.gov CPI latest United States`
- `site:stats.gov.cn China CPI PPI PMI latest month`
- `site:mospi.gov.in India CPI latest GDP latest`
- `site:cabinetoffice.gov.jp Japan GDP latest preliminary`
- `site:stat.go.jp Japan CPI latest`
- `site:ec.europa.eu/eurostat euro area inflation GDP latest`
- `site:ecb.europa.eu monetary policy decision latest inflation growth`
- `S&P Global PMI latest <economy> prices output employment`

## Interpretation Notes

- PMI above 50 usually signals expansion; below 50 signals contraction. Direction and subcomponents matter more than the exact threshold when the number is near 50.
- CPI is consumer inflation; PPI and PMI input prices can lead CPI but may also reflect margin compression.
- GDP is lagging. For "current" phase calls, use PMI, nowcasts, central bank language, and market-implied policy direction to temper GDP.
- If growth and inflation indicators disagree, provide a phase range and confidence instead of forcing precision.
