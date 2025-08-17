import { ITopic } from "../../../core/types/topic";
import { getTopicById } from "../topic_storage";

/**
 * Finds the shortest path between two topics in the topic hierarchy.
 * Uses recursive traversal up the parent chain to find the connection.
 * 
 * @param startTopic - The starting topic
 * @param endTopic - The destination topic
 * @returns Array of topic IDs representing the shortest path
 */
export const shortestPathBetweenTopics = (startTopic: ITopic, endTopic: ITopic): string[] => {
  if (startTopic.id === null) {
    return [startTopic.id!];
  }

  try {
    const parentTopic = getTopicById(endTopic.parentTopicId!);

    if (parentTopic.id === startTopic.id) {
      return [startTopic.id!, endTopic.id!];
    }

    return [...shortestPathBetweenTopics(startTopic, parentTopic), endTopic.id!];
  } catch (error) {
    return [startTopic.id!];
  }
};
