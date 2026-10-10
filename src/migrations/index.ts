import * as migration_20261007_013932_initial from './20261007_013932_initial'
import * as migration_20261007_045232_phase3_collections from './20261007_045232_phase3_collections'
import * as migration_20261007_045300_localities_trgm from './20261007_045300_localities_trgm'
import * as migration_20261007_050800_inquiry_statuses from './20261007_050800_inquiry_statuses'
import * as migration_20261007_054348_phase4_accounts from './20261007_054348_phase4_accounts'
import * as migration_20261007_061554_phase4_jobs from './20261007_061554_phase4_jobs'
import * as migration_20261007_131052_phase5_reviews_job from './20261007_131052_phase5_reviews_job'
import * as migration_20261007_152205_phase6_content from './20261007_152205_phase6_content'
import * as migration_20261007_153940_phase6_autosave from './20261007_153940_phase6_autosave'
import * as migration_20261010_024435_phase7_moderation from './20261010_024435_phase7_moderation'
import * as migration_20261010_032124_media_storage from './20261010_032124_media_storage'
import * as migration_20261010_110103_inquiry_retention from './20261010_110103_inquiry_retention'
import * as migration_20261010_204452_localities_city from './20261010_204452_localities_city'

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
  {
    up: migration_20261007_054348_phase4_accounts.up,
    down: migration_20261007_054348_phase4_accounts.down,
    name: '20261007_054348_phase4_accounts',
  },
  {
    up: migration_20261007_061554_phase4_jobs.up,
    down: migration_20261007_061554_phase4_jobs.down,
    name: '20261007_061554_phase4_jobs',
  },
  {
    up: migration_20261007_131052_phase5_reviews_job.up,
    down: migration_20261007_131052_phase5_reviews_job.down,
    name: '20261007_131052_phase5_reviews_job',
  },
  {
    up: migration_20261007_152205_phase6_content.up,
    down: migration_20261007_152205_phase6_content.down,
    name: '20261007_152205_phase6_content',
  },
  {
    up: migration_20261007_153940_phase6_autosave.up,
    down: migration_20261007_153940_phase6_autosave.down,
    name: '20261007_153940_phase6_autosave',
  },
  {
    up: migration_20261010_024435_phase7_moderation.up,
    down: migration_20261010_024435_phase7_moderation.down,
    name: '20261010_024435_phase7_moderation',
  },
  {
    up: migration_20261010_032124_media_storage.up,
    down: migration_20261010_032124_media_storage.down,
    name: '20261010_032124_media_storage',
  },
  {
    up: migration_20261010_110103_inquiry_retention.up,
    down: migration_20261010_110103_inquiry_retention.down,
    name: '20261010_110103_inquiry_retention',
  },
  {
    up: migration_20261010_204452_localities_city.up,
    down: migration_20261010_204452_localities_city.down,
    name: '20261010_204452_localities_city',
  },
]
