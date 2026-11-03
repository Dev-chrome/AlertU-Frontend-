import type { ImageSourcePropType } from 'react-native';

import { images } from '@/constants/images';

export type PulsePost = {
  id: string;
  name: string;
  avatar: ImageSourcePropType;
  time: string;
  content: string;
  likes: number;
  comments: number;
  verified?: boolean;
  tag?: { label: string; tone: 'blue' | 'green' };
  reaction?: string;
};

export const pulsePosts: PulsePost[] = [
  {
    id: 'wifi',
    name: 'Tech_Bro',
    avatar: images.avatarTech,
    time: '1h ago',
    content: 'Does anyone know if the WiFi is back in the hostel? Mine is still not working. 🙃',
    likes: 32,
    comments: 8,
    reaction: '😕',
  },
  {
    id: 'cafeteria',
    name: 'Queen_Anita',
    avatar: images.avatarQueen,
    time: '2h ago',
    content: 'The new cafeteria menu is actually 🔥🔥. Best food in a long time!',
    likes: 56,
    comments: 15,
    tag: { label: 'Campus Food', tone: 'blue' },
  },
  {
    id: 'meeting',
    name: 'Sammy',
    avatar: images.avatarSammy,
    time: '3h ago',
    content:
      "There's a meeting in the main hall tomorrow by 10am. All students should attend.",
    likes: 28,
    comments: 6,
    verified: true,
    tag: { label: 'School Notice', tone: 'blue' },
  },
  {
    id: 'library',
    name: 'Bright_Star',
    avatar: images.avatarBright,
    time: '3m ago',
    content:
      "The school library is having a free workshop on tech skills today at 3pm. Don't miss it!",
    likes: 45,
    comments: 12,
    verified: true,
  },
];

export type NewsItem = {
  id: string;
  tag: string;
  tone: 'blue' | 'orange' | 'red';
  title: string;
  description: string;
  time: string;
  likes: number;
  image: ImageSourcePropType;
  category: string;
};

export const newsItems: NewsItem[] = [
  {
    id: 'ict',
    tag: 'School News',
    tone: 'blue',
    title: 'New ICT Center Opens at Our Campus 🎉',
    description: 'The new ICT center is now open for students with modern facilities...',
    time: '2h ago',
    likes: 124,
    image: images.heroCampus,
    category: 'School News',
  },
  {
    id: 'freshers',
    tag: 'Gist',
    tone: 'orange',
    title: "Freshers' Week 2025 Finally Begins 🎉",
    description: 'The much-anticipated Freshers\u2019 Week is here with exciting activities...',
    time: '4h ago',
    likes: 98,
    image: images.freshers,
    category: 'Gist',
  },
  {
    id: 'workshop',
    tag: 'Events',
    tone: 'red',
    title: 'Tech Workshop Today at 3PM',
    description: "Free tech skills workshop at the library. Don't miss it!",
    time: '6h ago',
    likes: 76,
    image: images.workshop,
    category: 'Events',
  },
];

export type MapIncident = {
  id: string;
  title: string;
  shortTitle: string;
  location: string;
  time: string;
  category: 'Safety' | 'Incidents' | 'Events';
  tone: 'red' | 'yellow' | 'green' | 'navy' | 'blue' | 'purple';
  top: string;
  left: string;
  description: string;
  status: 'Under Review' | 'Verified' | 'Reported';
};

export const incidents: MapIncident[] = [
  {
    id: 'suspicious',
    title: 'Suspicious person near Library',
    shortTitle: 'Suspicious person',
    location: 'Near Library',
    time: '2 mins ago',
    category: 'Incidents',
    tone: 'red',
    top: '31%',
    left: '38%',
    description:
      'A suspicious individual was seen lingering near the University Library entrance. Campus security has been notified and is on the way.',
    status: 'Under Review',
  },
  {
    id: 'phone-theft',
    title: 'Phone theft reported outside cafeteria',
    shortTitle: 'Phone theft',
    location: 'Cafeteria',
    time: '18 mins ago',
    category: 'Incidents',
    tone: 'red',
    top: '62%',
    left: '74%',
    description:
      'A student reported their phone stolen outside the main cafeteria. Please keep your belongings close and report anything you saw.',
    status: 'Reported',
  },
  {
    id: 'lost-id',
    title: 'Lost student ID submitted to security',
    shortTitle: 'Lost student ID',
    location: 'Main Gate',
    time: '25 mins ago',
    category: 'Safety',
    tone: 'yellow',
    top: '39%',
    left: '18%',
    description:
      'A student ID was found near the main gate and handed to campus security. Visit the security desk to claim it.',
    status: 'Verified',
  },
  {
    id: 'first-aid',
    title: 'First aid station open at Sports Grounds',
    shortTitle: 'First aid station',
    location: 'Sports Grounds',
    time: '45 mins ago',
    category: 'Safety',
    tone: 'green',
    top: '51%',
    left: '62%',
    description:
      'The campus first aid station is open at the sports grounds during today\u2019s games. Stop by if you need assistance.',
    status: 'Verified',
  },
  {
    id: 'orientation',
    title: 'Orientation meeting at Main Hall',
    shortTitle: 'Orientation meeting',
    location: 'Main Hall',
    time: '1 hr ago',
    category: 'Events',
    tone: 'navy',
    top: '22%',
    left: '68%',
    description:
      'The new student orientation meeting starts at 10am in the Main Hall. All first-year students are encouraged to attend.',
    status: 'Verified',
  },
  {
    id: 'club-fair',
    title: 'Campus club fair this Friday',
    shortTitle: 'Club fair',
    location: 'Student Center',
    time: '2 hrs ago',
    category: 'Events',
    tone: 'blue',
    top: '69%',
    left: '28%',
    description:
      'Meet campus clubs and societies at the student center this Friday from 11am. There will be food, music, and giveaways.',
    status: 'Verified',
  },
  {
    id: 'escort',
    title: 'Safety escort available after 8PM',
    shortTitle: 'Safety escort',
    location: 'Campus Wide',
    time: '3 hrs ago',
    category: 'Safety',
    tone: 'purple',
    top: '44%',
    left: '47%',
    description:
      'Campus security offers walking escorts across campus after 8PM. Call the security desk or use the in-app safety escort request.',
    status: 'Verified',
  },
];

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  tone: 'red' | 'yellow' | 'green' | 'purple' | 'blue';
  icon: 'alert' | 'chat' | 'heart' | 'shield';
};

export type MockComment = {
  id: string;
  postId: string;
  name: string;
  body: string;
  time: string;
  verified?: boolean;
};

export const commentsByPostId: Record<string, MockComment[]> = {
  wifi: [
    {
      id: 'wifi-1',
      postId: 'wifi',
      name: 'Sammy',
      body: 'Still down in Block C. The library network is working if you need it.',
      time: '45m ago',
    },
    {
      id: 'wifi-2',
      postId: 'wifi',
      name: 'Tech_Bro',
      body: 'Thanks! Heading to the library now.',
      time: '32m ago',
    },
  ],
  cafeteria: [
    {
      id: 'cafeteria-1',
      postId: 'cafeteria',
      name: 'Bright_Star',
      body: 'The jollof rice is unmatched today. Get there before the queue builds up.',
      time: '1h ago',
    },
    {
      id: 'cafeteria-2',
      postId: 'cafeteria',
      name: 'Queen_Anita',
      body: 'Told you! The new menu is a big upgrade.',
      time: '48m ago',
    },
  ],
  meeting: [
    {
      id: 'meeting-1',
      postId: 'meeting',
      name: 'Campus Admin',
      body: 'Attendance will be taken. Please arrive a few minutes early.',
      time: '2h ago',
      verified: true,
    },
    {
      id: 'meeting-2',
      postId: 'meeting',
      name: 'Sammy',
      body: 'Is the meeting open to final-year students too?',
      time: '1h ago',
    },
  ],
  library: [
    {
      id: 'library-1',
      postId: 'library',
      name: 'Bright_Star',
      body: 'Bring your laptop if you have one. There are limited desktop stations.',
      time: '2m ago',
    },
  ],
  ict: [
    {
      id: 'ict-1',
      postId: 'ict',
      name: 'Tech_Bro',
      body: 'The new lab has fast machines and reliable power. Worth the walk.',
      time: '1h ago',
    },
    {
      id: 'ict-2',
      postId: 'ict',
      name: 'Campus Admin',
      body: 'Opening hours are 8am to 8pm on weekdays.',
      time: '52m ago',
      verified: true,
    },
  ],
  freshers: [
    {
      id: 'freshers-1',
      postId: 'freshers',
      name: 'Queen_Anita',
      body: 'The opening concert was so much fun. Who is going for the games today?',
      time: '3h ago',
    },
  ],
  workshop: [
    {
      id: 'workshop-1',
      postId: 'workshop',
      name: 'Bright_Star',
      body: 'I attended last semester. The practical session is the best part.',
      time: '5h ago',
    },
    {
      id: 'workshop-2',
      postId: 'workshop',
      name: 'Sammy',
      body: 'Do we need to register in advance?',
      time: '4h ago',
    },
  ],
};

export const notifications: NotificationItem[] = [
  {
    id: 'flood',
    title: 'Incident Update',
    body: 'Flooding near Library East is now Under Review.',
    time: '8 min ago',
    tone: 'yellow',
    icon: 'alert',
  },
  {
    id: 'comment',
    title: 'New Comment',
    body: 'Tunde Adebayo commented on your post.',
    time: '25 min ago',
    tone: 'green',
    icon: 'chat',
  },
  {
    id: 'like',
    title: 'Gist Like',
    body: 'Chizzy liked your post in Campus Pulse.',
    time: '1h ago',
    tone: 'purple',
    icon: 'heart',
  },
  {
    id: 'verified',
    title: 'System',
    body: 'Your report has been verified. Thank you for keeping campus safe.',
    time: '2h ago',
    tone: 'blue',
    icon: 'shield',
  },
];
