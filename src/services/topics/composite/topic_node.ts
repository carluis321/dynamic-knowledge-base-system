import { ITopic } from "../../../core/types/topic";
import { TopicComponent } from "./topic_component";

export class TopicNode extends TopicComponent {
  id: string | null;
  name: string;
  parentTopicId?: string | null;
  version?: number;
  createdAt: Date;
  updatedAt?: Date;
  content?: string;
  private children: TopicComponent[] = [];
  private parent: TopicComponent | null = null;

  constructor(topic: ITopic) {
    super();
    this.id = topic.id ?? null;
    this.name = topic.name;
    this.content = topic.content ?? "";
    this.parentTopicId = topic.parentTopicId ?? null;
    this.version = topic.version ?? 1;
    this.createdAt = topic.createdAt;
    this.updatedAt = topic.updatedAt;
  }

  setParent(parent: TopicComponent): void {
    this.parent = parent;
  }

  getParent(): TopicComponent | null {
    return this.parent;
  }

  add(child: TopicComponent): void {
    this.children.push(child);
  }

  getChildren(): TopicComponent[] {
    return this.children.slice();
  }

  find(id: string): TopicComponent | null {
    if (this.id === id) return this;
    
    const foundChild = this.children.find(child => child.id === id);
    if (foundChild) return foundChild;

    return null;
  }

  getAllIDs(): string[] {
    const id = this.id;

    const ids: string[] = [id!];

    this.children.forEach((child) => {
      ids.push(...child.getAllIDs());
    });

    return ids;
  }
}