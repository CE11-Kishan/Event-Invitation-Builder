import { forwardRef } from 'react';

export const InvitationPreview = forwardRef(function InvitationPreview({ form, previewImg }, ref) {
  const bg = previewImg?.includes('gradient') ? previewImg : previewImg ? `url(${previewImg})` : 'none';

  // Choose a cursive / decorative font priority for hero style
  const heroFont = 'font-script';

  return (
  <section ref={ref} className="rounded-lg border border-gray-200 p-0 bg-gray-50 h-[480px] flex flex-col invitation-shadow overflow-hidden">
      <div
        className="relative flex-1 flex items-center justify-center text-center select-none"
        style={{ backgroundImage: bg, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-white/60 backdrop-soft" />
        <div className="relative px-6 py-8 max-w-3xl mx-auto flex flex-col items-center justify-center h-full w-full">
          <h3
            className={`text-4xl md:text-6xl lg:text-6xl ${heroFont} tracking-wide drop-shadow-sm text-gray-800 !leading-[96px]`}
            style={{ letterSpacing: '.03em' }}
          >
            {form.title || 'Your Event Title'}
          </h3>
          <div className="mt-6 flex flex-col gap-2 text-gray-700 text-sm md:text-base font-medium">
            {form.host && <span className="opacity-90">Hosted by {form.host}</span>}
            {form.startDateTime && <span className="opacity-90">{form.startDateTime}</span>}
            {form.location && <span className="opacity-90">{form.location}</span>}
          </div>
          {form.eventType && (
            <span className="mt-8 inline-block text-[10px] md:text-xs uppercase tracking-[0.3em] px-4 py-2 rounded-full bg-gray-900/80 text-white shadow-md">
              {form.eventType.replace('_', ' ')}
            </span>
          )}
        </div>
        {/* Ambient gradients */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-10 -left-10 w-52 h-52 bg-gradient-to-br from-rose-200/50 via-transparent to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-gradient-to-tr from-indigo-200/50 via-transparent to-transparent rounded-full blur-3xl" />
        </div>
      </div>
    </section>
  );
});
