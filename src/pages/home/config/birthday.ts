import type { Section } from './home.config';

export const BIRTHDAY_SECTION: Section = {
  id: 'birthday',
  title: '🎂 Birthday',
  description: 'Thiệp sinh nhật vui nhộn và ý nghĩa',
  cards: [
    {
      id: 'birthday-party',
      templateName: 'demo',
      title: 'Birthday Party',
      description: 'Bữa tiệc sinh nhật rực rỡ',
      thumbnail: '/images/birthday-party.jpg',
      thumbnailType: 'image',
      demoLink: '/demo/demo?preview=true',
      createLink: '/input?template=demo'
    },
    {
      id: 'birthday-cake',
      templateName: 'demo',
      title: 'Sweet Birthday',
      description: 'Bánh kem ngọt ngào',
      thumbnail: '/images/birthday-cake.jpg',
      thumbnailType: 'image',
      demoLink: '/demo/demo?preview=true',
      createLink: '/input?template=demo'
    }
  ]
};
