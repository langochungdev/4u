export interface TemplateCard {
  id: string;
  templateName: string;
  title: string;
  description: string;
  thumbnail: string; // Path to image or video
  thumbnailType: 'image' | 'video';
  demoLink: string; // Link to demo page
  buyLink: string; // Link to buy/input page
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  cards: TemplateCard[];
}

export const HOME_SECTIONS: Section[] = [
  {
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
        buyLink: '/galaxy'
      }
    ]
  },
  {
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
        buyLink: '/input?template=demo'
      },
      {
        id: 'birthday-cake',
        templateName: 'demo',
        title: 'Sweet Birthday',
        description: 'Bánh kem ngọt ngào',
        thumbnail: '/images/birthday-cake.jpg',
        thumbnailType: 'image',
        demoLink: '/demo/demo?preview=true',
        buyLink: '/input?template=demo'
      }
    ]
  },
  {
    id: 'wedding',
    title: '💒 Wedding',
    description: 'Thiệp cưới sang trọng và lộng lẫy',
    cards: [
      {
        id: 'elegant-wedding',
        templateName: 'demo',
        title: 'Elegant Wedding',
        description: 'Sang trọng và tinh tế',
        thumbnail: '/images/elegant-wedding.jpg',
        thumbnailType: 'image',
        demoLink: '/demo/demo?preview=true',
        buyLink: '/input?template=demo'
      },
      {
        id: 'romantic-wedding',
        templateName: 'demo',
        title: 'Romantic Wedding',
        description: 'Lãng mạn và ấm áp',
        thumbnail: '/images/romantic-wedding.jpg',
        thumbnailType: 'image',
        demoLink: '/demo/demo?preview=true',
        buyLink: '/input?template=demo'
      },
      {
        id: 'modern-wedding',
        templateName: 'demo2',
        title: 'Modern Wedding',
        description: 'Hiện đại và trẻ trung',
        thumbnail: '/images/modern-wedding.jpg',
        thumbnailType: 'image',
        demoLink: '/demo2/demo?preview=true',
        buyLink: '/input?template=demo2'
      }
    ]
  }
];
