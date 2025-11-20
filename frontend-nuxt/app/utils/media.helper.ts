// Video->audio conversion has been removed from the client; helper is deprecated.
export async function extractAudioFromVideo(): Promise<File> {
  throw new Error('extractAudioFromVideo is deprecated and removed.');
}
