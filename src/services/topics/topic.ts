import { TopicBase } from "./topics_base";


export class Topic extends TopicBase {
  id: string | null;
  version?: number;

  constructor(
    name: string,
    version?: number,
    content?: string,
    parentTopicId?: string | null,
    id?: string | null,
  ) {
    super(name, version ?? 1, content, parentTopicId);
    this.id = id || null;
  }
}