import VideoFeed from '../(dashboard)/long/VideoFeed';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeTab() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }} edges={['top']}>
      <VideoFeed />
    </SafeAreaView>
  );
}

// In app/(tabs)/profile.tsx
// import CommunityAnalyticsDemo from '../(demo)/CommunityAnalyticsDemo';

// export default function HomeTab() {
//   return <CommunityAnalyticsDemo />;
// }

// import DemoShowcase from '../(demo)/DemoShowcase';

// export default function HomeTab() {
//   return <DemoShowcase />;
// }