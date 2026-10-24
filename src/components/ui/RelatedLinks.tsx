import { Link } from 'react-router-dom';

// Related content sidebar: a blue top rule over a short list of links.
export default function RelatedLinks({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string; note?: string }[];
}) {
  if (links.length === 0) return null;

  return (
    <aside
      aria-label={title}
      className="border-t-2 border-primary-600 pt-[15px]"
    >
      <h2 className="type-m mb-[15px]">{title}</h2>
      <ul className="type-small space-y-2.5">
        {links.map(link => (
          <li key={link.href}>
            <Link to={link.href} className="link">
              {link.label}
            </Link>
            {link.note && ` ${link.note}`}
          </li>
        ))}
      </ul>
    </aside>
  );
}
