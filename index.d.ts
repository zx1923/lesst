declare interface String {
  black(): string,
  bgYellow(): string,
  bold(): string,
  red(): string,
  cyan(): string,
  yellow(): string,
  grey(): string
}

declare interface tFailedInfo {
  cmd: string,
  args: Array<string>,
  stdout: string,
  stdin: string,
  failed: string
}