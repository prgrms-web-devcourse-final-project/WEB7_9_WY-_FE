'use client';

import { Avatar, AvatarProps, Box, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { getArtistColor } from '@/lib/artistColors';

interface ArtistAvatarProps extends Omit<AvatarProps, 'children'> {
  name: string;
  shortName?: string;
  image?: string;
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  showName?: boolean;
  selected?: boolean;
}

const sizeMap = {
  xsmall: { avatar: 24, fontSize: '0.625rem' },
  small: { avatar: 40, fontSize: '0.875rem' },
  medium: { avatar: 60, fontSize: '1rem' },
  large: { avatar: 80, fontSize: '1.25rem' },
};

export default function ArtistAvatar({
  name,
  shortName: _shortName,
  image,
  size = 'medium',
  showName = false,
  selected = false,
  sx,
  ...props
}: ArtistAvatarProps) {
  // shortName is available via _shortName if needed in future
  void _shortName;
  const theme = useTheme();
  const sizeConfig = sizeMap[size];
  const artistColor = getArtistColor(name);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      <Avatar
        src={image}
        alt={`${name} 프로필 이미지`}
        sx={{
          width: sizeConfig.avatar,
          height: sizeConfig.avatar,
          fontSize: sizeConfig.fontSize,
          fontWeight: 700,
          border: selected ? '3px solid' : '2px solid',
          borderColor: selected ? artistColor : alpha(artistColor, 0.3),
          bgcolor: artistColor,
          color: '#FFFFFF',
          transition: 'all 0.2s ease',
          ...(selected && {
            boxShadow: `0 0 0 2px ${alpha(artistColor, 0.3)}`,
          }),
          '&:hover': {
            borderColor: artistColor,
            transform: 'scale(1.05)',
          },
          ...sx,
        }}
        {...props}
      >
        {name.charAt(0)}
      </Avatar>
      {showName && (
        <Typography
          variant="caption"
          sx={{
            fontWeight: selected ? 600 : 400,
            color: selected ? artistColor : theme.palette.text.primary,
            textAlign: 'center',
            maxWidth: sizeConfig.avatar + 20,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease',
          }}
        >
          {name}
        </Typography>
      )}
    </Box>
  );
}
