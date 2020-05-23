import { slotSelector, slotProperty, slotAttribute, slotMarker, slotId } from "./constants";
import { isOpenTagEnd } from "./utils";
import { attribute, markedStrings, event } from "./regex-patterns";

export enum ValueType {
  Attribute = "attribute",
  Event = "event",
  Template = "template",
  Text = "text",
}

export type ValueData = [string, unknown, boolean] | Template | Template[] | string;

export class Value {
  type: ValueType;
  data: ValueData;

  constructor(type: ValueType, data: ValueData) {
    this.type = type;
    this.data = data;
  }
}

export class Template {
  readonly string: string;
  readonly values: readonly Value[];

  constructor(string: string, values: readonly Value[]) {
    this.string = string;
    this.values = values;
  }
}

export function html(strings: TemplateStringsArray, ...values: readonly unknown[]): Template {
  let annotatedString: string;
  let annotatedValues: Value[] = [];
  const rawStrings: readonly string[] = strings.raw;

  values.forEach((value, i) => {
    let key: string;
    let val: any;
    let str: string = strings[i];
    const isLastAttr = isOpenTagEnd(rawStrings[i + 1]) ?? true;

    if ((key = str.match(event)?.[1])) {
      val = new Value(ValueType.Event, [key, value, isLastAttr]);
    } else if ((key = str.match(attribute)?.[1])) {
      val = new Value(ValueType.Attribute, [key, value, isLastAttr]);
    } else if (value instanceof Template || value?.[0] instanceof Template) {
      val = new Value(ValueType.Template, value as Template[]);
    } else {
      val = new Value(ValueType.Text, String(value));
    }

    annotatedValues.push(val);
  });

  let slotIndex: number = -1;
  annotatedString = strings.join(slotMarker).replace(markedStrings, () => {
    const val = annotatedValues[++slotIndex];
    if (val.type === ValueType.Text || val.type === ValueType.Template) {
      return `<template data-slot-${slotId}="${slotIndex}"></template>`;
    } else {
      return val.data[2] ? `data-slot-${slotId}="${slotIndex}"` : "";
    }
  });

  return new Template(annotatedString, annotatedValues);
}

export function render(template: Template, container: Element) {
  if (container === null) {
    throw new Error(`Container cannot be null.`);
  }

  console.log(template.string, template.values);
}