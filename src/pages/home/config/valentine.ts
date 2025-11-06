import type { Section } from './home.config';

export const VALENTINE_SECTION: Section = {
  id: 'valentine',
  title: '💕 Valentine',
  description: 'Thiệp tình yêu lãng mạn cho ngày Valentine',
  cards: [
    {
      id: 'galaxy-love',
      templateName: 'galaxy',
      title: 'Galaxy Love',
      description: 'Tình yêu như vũ trụ bao la',
      thumbnail: '/demo-media/galaxy.png',
      thumbnailType: 'image',
      demoLink: '/galaxy/V0HKGYZwoJY7PSOmR95n',
      createLink: '/input?template=galaxy'
    },
  ]
};
