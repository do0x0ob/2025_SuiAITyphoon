import { ASCII_ART } from '@/constants/ascii';
import { ABOUT_CONTENT } from '@/constants/content';

export default function AboutContent() {
  return (
    <div className="p-4">
      <pre className="text-[0.6rem] leading-[1.15] font-mono mb-4 select-none">
        {ASCII_ART.MEMENTO_OS}
      </pre>
      <div className="text-gray-800 space-y-3 text-sm">
        <p className="italic text-sm">{ABOUT_CONTENT.subtitle}</p>
        <p className="text-sm">{ABOUT_CONTENT.welcome}</p>
        <div>
          <h2 className="font-bold mb-2 text-sm">{ABOUT_CONTENT.salonTitle}</h2>
          <ul className="list-disc pl-6 space-y-1">
            {ABOUT_CONTENT.salonFeatures.map((feature, index) => (
              <li key={index} className="text-sm">{feature}</li>
            ))}
          </ul>
        </div>
        <p className="text-sm">{ABOUT_CONTENT.poweredBy}</p>
        <p className="text-sm">{ABOUT_CONTENT.dedication}</p>
        <p className="text-sm">{ABOUT_CONTENT.closing}</p>
      </div>
      <pre className="text-[0.6rem] leading-[1.15] font-mono mt-4 select-none">
        {ASCII_ART.AUTHOR_2}
      </pre>
    </div>
  );
} 