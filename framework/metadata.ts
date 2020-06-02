export enum MetadataType {
  Attribute = "attribute",
  Event = "event",
  Iterator = "iterator",
  Template = "template",
  Text = "text",
}

export class Metadata {
  readonly type: MetadataType;
  readonly value: readonly any[];

  constructor(type: MetadataType, value?: readonly any[]) {
    this.type = type;
    this.value = value;
  }
}
