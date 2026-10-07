import { ZxcvbnFactory } from '@zxcvbn-ts/core'
import { adjacencyGraphs, dictionary as common } from '@zxcvbn-ts/language-common'
import { dictionary as polish, translations } from '@zxcvbn-ts/language-pl'

import { PASSWORD_MIN_LENGTH } from './password-rules'

let factory: ZxcvbnFactory | null = null

/** Ocena siły hasła z polskim słownikiem (ADR 0018). Wynik 0–4; przyjmujemy od 3. */
export function passwordStrength(password: string, userInputs: string[] = []) {
  factory ??= new ZxcvbnFactory({
    dictionary: { ...common, ...polish },
    graphs: adjacencyGraphs,
    translations,
  })
  const result = factory.check(password.slice(0, 128), userInputs)
  return {
    score: result.score,
    warning: result.feedback.warning ?? null,
    suggestions: result.feedback.suggestions,
  }
}

export const isStrongPassword = (password: string, userInputs: string[] = []) =>
  password.length >= PASSWORD_MIN_LENGTH && passwordStrength(password, userInputs).score >= 3
