import { Injectable } from '@angular/core';
import { Title, Meta, MetaDefinition } from '@angular/platform-browser';

export interface PageMetadata {
  title: string;
  description: string;
  type: string;
  image: string;
  url: string;
}

export const defaultMetadata: PageMetadata = {
  title: 'Feral File',
  description:
    'Showcasing the world’s most revered digital artists, including LaTurbo Avedon, Refik Anadol, and Lu Yang. Dive into the art of Auriea Harvey, Tyler Hobbs, and more pioneers shaping the digital era.',
  type: 'website',
  image: 'https://feralfile.com/assets/feralfile-og.png',
  url: 'https://feralfile.com',
};

@Injectable({
  providedIn: 'root',
})
export class MetadataService {
  constructor(private titleService: Title, private metaService: Meta) {}

  public updateMetadata(metadata: Partial<PageMetadata>): void {
    const pageMetadata: PageMetadata = { ...defaultMetadata, ...metadata };
    const metatags: MetaDefinition[] =
      this.generateMetaDefinitions(pageMetadata);

    metatags.forEach((tag: MetaDefinition) => {
      this.metaService.updateTag(tag);
    });

    this.titleService.setTitle(pageMetadata.title);
  }

  private generateMetaDefinitions(metadata: PageMetadata): MetaDefinition[] {
    return [
      { name: 'twitter:title', content: metadata.title },
      { property: 'og:title', content: metadata.title },

      // { name: 'description', content: metadata.description },
      // { name: 'twitter:description', content: metadata.description },
      // { property: 'og:description', content: metadata.description },

      // { name: 'twitter:image', content: metadata.image },
      // { property: 'og:image', content: metadata.image },

      // { property: 'og:type', content: metadata.type },
      // { property: 'og:site_name', content: 'Feral File' },
      // { property: 'og:url', content: metadata.url },
    ];
  }
}
