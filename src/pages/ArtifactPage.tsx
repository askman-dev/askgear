import { ArtifactCreationView } from '@components/artifact/ArtifactCreationView';

interface ArtifactPageProps {
  initialText?: string;
  onBack: () => void;
}

export function ArtifactPage({ initialText, onBack }: ArtifactPageProps) {
  return <ArtifactCreationView initialText={initialText} onBack={onBack} />;
}
