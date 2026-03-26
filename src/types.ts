export type ChoiceNode = {
  kind: "choice";
  prompt: string;
  branches: Record<string, string>;
};

export type EndNode = {
  kind: "end";
  text: string;
};

export type SkillNode = ChoiceNode | EndNode;

export type Skill = {
  id: string;
  start: string;
  nodes: Record<string, SkillNode>;
};
