import { ITopic } from "../../../core/types/topic";
import { Topic } from "../topic";


export class TopicFactory{
  static create(name: string, content?: string, parentTopicId?: string | null, version: number = 1, id?: string): ITopic {
    const topic = new Topic(name, version, content, parentTopicId, id);
    return topic;
  }
}
