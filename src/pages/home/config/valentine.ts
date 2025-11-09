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
      createLink: '/galaxy'
    },
    {
      id: 'love-more-v1',
      templateName: 'love-more-v1',
      title: 'Love More v1',
      description: 'Tình yêu mãnh liệt hơn',
      thumbnail: '/demo-media/love-more-v1.png',
      thumbnailType: 'image',
      demoLink: '/love-more-v1/swnrNR1nSpOQI41n25Ac',
      createLink: '/love-more-v1'
    },
    {
      id: 'anniversary-love',
      templateName: 'anniversary-love',
      title: 'Anniversary Love',
      description: 'Kỷ niệm tình yêu ngọt ngào - pass demo 1234',
      thumbnail: '/demo-media/anniversary-love.png',
      thumbnailType: 'image',
      demoLink: '/anniversary-love/UFXpAGPqCcK0oS3USOez',
      createLink: '/anniversary-love'
    },
  ]
};
