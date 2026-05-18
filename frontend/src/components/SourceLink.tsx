// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: AGPL-3.0-only

import { SOURCE_REPOSITORY_URL, SUPPORT_LINK_LABELS } from '../services/supportLinks'

export function SourceLink() {
  return (
    <p className="source-credit">
      <a href={SOURCE_REPOSITORY_URL} target="_blank" rel="noreferrer" aria-label={SUPPORT_LINK_LABELS.source}>
        Source
      </a>
    </p>
  )
}
