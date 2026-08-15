export interface Dictionary {
  common: {
    backToHome: string;
  };
  home: {
    heading: string;
    footer: {
      about: string;
      techStack: string;
      componentGallery: string;
      iconGallery: string;
      chartGallery: string;
      avatarGallery: string;
    };
  };
  about: {
    headerTitle: string;
    badge: string;
    heroTitle: string;
    heroDescription: string;
    features: { title: string; description: string }[];
    galleriesHeading: string;
    galleriesDescription: string;
    galleries: { title: string; description: string; cta: string }[];
  };
  gallery: {
    headerTitle: string;
    heading: string;
    description: string;
  };
  icons: {
    headerTitle: string;
    heading: string;
    description: string;
  };
  avatars: {
    headerTitle: string;
    heading: string;
    description: string;
  };
  charts: {
    headerTitle: string;
    heading: string;
    description: string;
  };
  techStack: {
    headerTitle: string;
    heading: string;
    description: string;
  };
}
