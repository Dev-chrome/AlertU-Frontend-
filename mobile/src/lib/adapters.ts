import type { ImageSourcePropType } from 'react-native';

import { images } from '@/constants/images';

const avatars: ImageSourcePropType[] = [
  images.avatarPromise,
  images.avatarTech,
  images.avatarQueen,
  images.avatarSammy,
  images.avatarBright,
];

export const avatarForName = (name: string): ImageSourcePropType => {
  const hash = Array.from(name).reduce((total, char) => total + char.charCodeAt(0), 0);
  return avatars[hash % avatars.length];
};
