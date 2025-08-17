import { ITopic } from "../../core/types/topic";

export abstract class TopicBase implements ITopic {
  id?: string | null;
  name: string;
  content?: string;
  createdAt: Date;
  updatedAt?: Date;
  version?: number;
  parentTopicId?: string | null;

  private children: ITopic[] = [];
  private parentTopic: ITopic | null = null;

  constructor(name: string, version: number, content?: string, parentTopicId?: string | null) {
    this.name = name;
    this.content = content;
    this.version = version || 1;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.parentTopicId = parentTopicId || null;
  }
}
