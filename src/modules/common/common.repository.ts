import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
@Injectable()
export class CommonRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getTopics(query: { tree?: boolean }) {
    const topics = await this.drizzleService.db.query.topics.findMany({
      columns: {
        id: true,
        name: true,
        parentId: true,
      },
    });

    if (!query.tree) return topics;

    const topicMap = new Map();
    topics.forEach((topic) => {
      topicMap.set(topic.id, {
        id: topic.id,
        name: topic.name,
        subtopics: undefined,
      });
    });

    const rootTopics: { id: any; name: any; subtopics?: any }[] = [];
    topics.forEach((topic) => {
      if (topic.parentId) {
        const parent = topicMap.get(topic.parentId);
        if (parent) {
          if (!parent.subtopics) parent.subtopics = [];
          parent.subtopics.push(topicMap.get(topic.id));
        }
      } else {
        rootTopics.push(topicMap.get(topic.id));
      }
    });

    const cleanTree = (nodes) => {
      return nodes.map((node) => {
        if (!node.subtopics) {
          const { subtopics, ...cleanNode } = node;
          return cleanNode;
        }
        node.subtopics = cleanTree(node.subtopics);
        return node;
      });
    };

    return cleanTree(rootTopics);
  }

  async getMainTopics() {
    return await this.drizzleService.db.query.topics.findMany({
      columns: {
        id: true,
        name: true,
        parentId: true,
      },
      where: (topics, { isNull }) => isNull(topics.parentId),
    });
  }

  private buildTree(topics: any[]): any[] {
    const topicMap = new Map();

    topics.forEach((topic) => {
      topicMap.set(topic.id, { ...topic, subtopics: [] });
    });

    const tree: any[] = [];
    topics.forEach((topic) => {
      if (topic.parentId) {
        topicMap.get(topic.parentId).subtopics.push(topicMap.get(topic.id));
      } else {
        tree.push(topicMap.get(topic.id));
      }
    });

    return tree;
  }
}
