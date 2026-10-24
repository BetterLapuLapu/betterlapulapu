import { useTranslation } from 'react-i18next';
import { ISSUES_URL } from '../../data/navigation';

// Phase banner: says the site is new and community-run.
export default function PhaseBanner() {
  const { t } = useTranslation();

  return (
    <div className="width-container w-full">
      <p className="type-small flex items-baseline gap-2.5 border-b border-rule py-2.5">
        <strong className="shrink-0 bg-tag px-2 pt-0.5 pb-[3px] font-normal text-tag-text">
          {t('phase.tag')}
        </strong>
        <span>
          {t('phase.text')}{' '}
          <a href={ISSUES_URL} className="link">
            {t('phase.feedback')}
          </a>
          .
        </span>
      </p>
    </div>
  );
}
