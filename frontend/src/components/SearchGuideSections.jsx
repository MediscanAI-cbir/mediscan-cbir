export function SearchGuideSectionHeader({
  eyebrowId,
  eyebrow,
  title,
  description,
  containerClassName = "max-w-3xl",
  eyebrowClassName = "",
  titleClassName = "",
  descriptionClassName = "",
}) {
  return (
    <div className={containerClassName}>
      <p id={eyebrowId} className={eyebrowClassName}>
        {eyebrow}
      </p>
      <h2 className={titleClassName}>
        {title}
      </h2>
      <p className={descriptionClassName}>
        {description}
      </p>
    </div>
  );
}

export function SearchGuideCard({
  icon,
  label,
  title,
  description,
  note,
  articleClassName = "flex items-start gap-4",
  iconWrapperClassName = "",
  contentClassName = "min-w-0",
  headingClassName = "flex flex-wrap items-center gap-2",
  chipClassName = "",
  titleClassName = "",
  descriptionClassName = "",
  noteClassName = "",
}) {
  return (
    <article className={articleClassName}>
      <div className={iconWrapperClassName}>
        {icon}
      </div>
      <div className={contentClassName}>
        <div className={headingClassName}>
          <span className={chipClassName}>
            {label}
          </span>
          <h3 className={titleClassName}>
            {title}
          </h3>
        </div>
        <p className={descriptionClassName}>
          {description}
        </p>
        <p className={noteClassName}>
          {note}
        </p>
      </div>
    </article>
  );
}
