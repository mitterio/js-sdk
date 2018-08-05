export class ContextFreeMessage {
  constructor(
    public contextType: string,
    public context: string,
    public senderId: string,
    public data: object
  ) {}
}
