import { ITopic } from "../../../core/types/topic";
import { TopicNode } from "./topic_node";
import { getTopicsByParentId } from "../topic_storage";

/**
 * Composes a topic into a composite structure using the Composite pattern.
 * Recursively builds a tree structure with the given topic as root and all its children.
 * 
 * @param topic - The root topic to compose
 * @returns TopicNode representing the composed topic tree
 */
export const compositeTopic = (topic: ITopic): TopicNode => {
  const node = new TopicNode(topic);

  const children = getTopicsByParentId(topic.id!);

  if (children.length === 0) return node;

  children.forEach((child) => {
    const childNode = compositeTopic(child);
    node.add(childNode);
  });

  return node;
};
