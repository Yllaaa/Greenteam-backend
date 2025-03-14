interface UserGreenChallenge {
  id: string;
  userId: string;
  challengeId: string;
  status: string;
  challenge: {
    id: string;
    topicId: number;
  };
}
