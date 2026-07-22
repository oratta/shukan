import { describe, it, expect } from 'vitest';
import { HELP_TOPIC_IDS, splitHelpBody } from '@/data/help-topics';
import ja from '@/messages/ja.json';
import en from '@/messages/en.json';

/**
 * ヘルプトピックマスター（help-topics.ts）と messages の整合性ガード。
 *
 * <HelpButton topic="..." /> は help.topics.<id>.title / .body を実行時に引くため、
 * registry に ID を足したのに片方のロケールへ文言を書き忘れる・逆に messages 側に
 * registry にない孤児トピックが残る、という壊れ方をここで検出する。
 */

type HelpMessages = {
  ariaLabel: string;
  topics: Record<string, { title: string; body: string }>;
};

const locales: Record<string, HelpMessages> = {
  ja: ja.help as HelpMessages,
  en: en.help as HelpMessages,
};

describe('help topics master', () => {
  for (const [locale, help] of Object.entries(locales)) {
    describe(locale, () => {
      it('has title and non-empty body for every registered topic', () => {
        for (const id of HELP_TOPIC_IDS) {
          const topic = help.topics[id];
          expect(topic, `help.topics.${id} missing in ${locale}.json`).toBeDefined();
          expect(topic.title.trim().length, `empty title: ${id}`).toBeGreaterThan(0);
          expect(splitHelpBody(topic.body).length, `empty body: ${id}`).toBeGreaterThan(0);
        }
      });

      it('has no orphan topics outside the registry', () => {
        const registered = new Set<string>(HELP_TOPIC_IDS);
        const orphans = Object.keys(help.topics).filter((id) => !registered.has(id));
        expect(orphans).toEqual([]);
      });

      it('ariaLabel interpolates the topic title', () => {
        expect(help.ariaLabel).toContain('{title}');
      });
    });
  }
});

describe('splitHelpBody', () => {
  it('splits paragraphs on newlines and trims whitespace', () => {
    expect(splitHelpBody('第一段落。\n第二段落。\n\n 第三段落。 ')).toEqual([
      '第一段落。',
      '第二段落。',
      '第三段落。',
    ]);
  });

  it('returns a single paragraph as-is', () => {
    expect(splitHelpBody('ひとつだけ。')).toEqual(['ひとつだけ。']);
  });

  it('drops whitespace-only paragraphs', () => {
    expect(splitHelpBody('  \n\n  ')).toEqual([]);
  });
});
