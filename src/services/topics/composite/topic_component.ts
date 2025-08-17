export abstract class TopicComponent {
  abstract id: string | null;
  abstract name: string;
  abstract parentTopicId?: string | null;
  abstract version?: number;
  abstract createdAt: Date;
  abstract updatedAt?: Date;

  abstract add(child: TopicComponent): void;
  abstract getChildren(): TopicComponent[];
  abstract find(id: string): TopicComponent | null;
  abstract getAllIDs(): string[];
  // abstract toITopic(): ITopic;
}