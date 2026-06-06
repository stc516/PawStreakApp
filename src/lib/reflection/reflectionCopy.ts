export function reflectionIntroLine(dogName: string): string {
  const name = dogName.trim() || 'your pup'
  return `Quick check-in about ${name}`
}

export function reflectionSkipLabel(): string {
  return 'Skip for now'
}

export function reflectionDoneLine(dogName: string): string {
  const name = dogName.trim() || 'Your pup'
  return `Got it — ${name}'s adventure is on the record.`
}
