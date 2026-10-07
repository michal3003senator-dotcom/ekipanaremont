import * as migration_20261007_013932_initial from './20261007_013932_initial'
import * as migration_20261007_045232_phase3_collections from './20261007_045232_phase3_collections'
import * as migration_20261007_045300_localities_trgm from './20261007_045300_localities_trgm'
import * as migration_20261007_050800_inquiry_statuses from './20261007_050800_inquiry_statuses'

export const migrations = [
  {
    up: migration_20261007_013932_initial.up,
    down: migration_20261007_013932_initial.down,
    name: '20261007_013932_initial',
  },
  {
    up: migration_20261007_045232_phase3_collections.up,
    down: migration_20261007_045232_phase3_collections.down,
    name: '20261007_045232_phase3_collections',
  },
  {
    up: migration_20261007_045300_localities_trgm.up,
    down: migration_20261007_045300_localities_trgm.down,
    name: '20261007_045300_localities_trgm',
  },
  {
    up: migration_20261007_050800_inquiry_statuses.up,
    down: migration_20261007_050800_inquiry_statuses.down,
    name: '20261007_050800_inquiry_statuses',
  },
]
