# Changelog

## [1.2.0](https://github.com/dewstouh/niby-discord-bot/compare/v1.1.0...v1.2.0) (2025-07-20)


### Features

* add Docker support with Dockerfile, docker-compose and CI workflow for Niby ([5b50910](https://github.com/dewstouh/niby-discord-bot/commit/5b509105da957ad1cd8a63bec6c7e1dea70e5e47))


### Bug Fixes

* **ci:** write repo name to $GITHUB_ENV instead of invalid $GITHUB to fix env setup ([6618b96](https://github.com/dewstouh/niby-discord-bot/commit/6618b962e732bf01e3d3b00cbf863893391a6080))
* **db:** fallback to local mongodb if DATABASE_URL is undefined and enable autoIndex ([9e58a00](https://github.com/dewstouh/niby-discord-bot/commit/9e58a00f2d84858a4da0b76787cd1b05124939f9))

## [1.1.0](https://github.com/dewstouh/niby-discord-bot/compare/v1.0.0...v1.1.0) (2025-07-10)


### Features

* **assets:** add image previews ([10552b4](https://github.com/dewstouh/niby-discord-bot/commit/10552b4bd36f0f59e011a2a35ced53c5bbe20595))


### Bug Fixes

* **client:** ensure shardId and clusterId are replaced as strings in custom status ([e56b5e6](https://github.com/dewstouh/niby-discord-bot/commit/e56b5e6b96210bb121e54770f33a73819d88f15b))
* **commands/eval:** remove nibybin api implementation as it is not longer supported ([a8efe81](https://github.com/dewstouh/niby-discord-bot/commit/a8efe811c7e832809c4d9db975c16274ede4d100))
* **commands/lyrics:** add typings for json response in lyrics object ([d8e6661](https://github.com/dewstouh/niby-discord-bot/commit/d8e66616b153febd9065f4f031586c7a42bee7e2))
* correct release after tag cleaup ([6f4ba33](https://github.com/dewstouh/niby-discord-bot/commit/6f4ba3301b8783f8d4c593fbbdf3bcf1e388c571))
* **db:** SearchPlatform dependency on wrong dir path ([2e782bc](https://github.com/dewstouh/niby-discord-bot/commit/2e782bc0ec07a2b113fe2ea8bb9cf12e097fe849))
* **deps:** update/fix dependency references ([082c8ba](https://github.com/dewstouh/niby-discord-bot/commit/082c8ba0dad1a6fd5ee92baeeff46fb56d7db861))
* **handlers:** ensure channel has property send in CommandHandler ([d2b26a1](https://github.com/dewstouh/niby-discord-bot/commit/d2b26a1fb64117dc28ad7c3ada4324d30af3c92c))
* **utils/general:** ensure typings for data response in getNsfwImage and cluster information in receiveBotInfo ([80e7c4f](https://github.com/dewstouh/niby-discord-bot/commit/80e7c4fed1c7751b9ee9d1943c15d46befb6ada2))
* **utils/music:** remove Element typing on soundcloud autoplay scrapping ([62ab62a](https://github.com/dewstouh/niby-discord-bot/commit/62ab62af6a8375c3d8f8923878e41bcc27042e9c))
