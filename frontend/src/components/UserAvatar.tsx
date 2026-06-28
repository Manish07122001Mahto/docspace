import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type UserAvatarProps = {
  initials: string;
};

export function UserAvatar({ initials }: UserAvatarProps) {
  return (
    <Avatar>
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
