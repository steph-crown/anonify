export function Privacy() {
  return (
    <section className="bg-[#EFE6D8]">
      <div className="wrapper py-16 sm:py-28 max-w-5xl">
        <div className="flex items-center justify-center gap-3">
          <h2 className="text-center text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
            How it stays private
          </h2>
          <span className="flex size-7 items-center justify-center rounded-full border border-stone-300 bg-white text-xs text-stone-500">
            🔒
          </span>
        </div>

        <div className="mt-10 space-y-8 border-t border-stone-300 pt-8 text-sm text-stone-700">
          {/* Row 1 */}
          <div className="grid gap-4 border-b border-stone-300 pb-8 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)] sm:gap-10">
            <h3 className="text-lg font-semibold text-stone-800">
              Your data never touches our cloud.
            </h3>
            <p className="leading-relaxed text-stone-600">
              When you use Anonify, your sensitive text and session mappings are
              stored in a local-first database (IndexedDB) directly inside your
              browser. It never leaves your device, and we have zero access to
              it.
            </p>
          </div>

          {/* Row 2 */}
          <div className="grid gap-4 border-b border-stone-300 pb-8 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)] sm:gap-10">
            <h3 className="text-lg font-semibold text-stone-800">
              Where is my data?
            </h3>
            <p className="leading-relaxed text-stone-600">
              Your “Original” text and the “Protected” version stay in an
              isolated storage pocket on your computer, protected by your
              browser&apos;s same-origin policy. Think of it as a ghost file
              that only this website can read, and only on this specific
              machine.
            </p>
          </div>

          {/* Row 3 */}
          <div className="grid gap-4 border-b border-stone-300 pb-8 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)] sm:gap-10">
            <h3 className="text-lg font-semibold text-stone-800">
              Why store it at all?
            </h3>
            <div className="space-y-3 text-stone-600">
              <p className="leading-relaxed">
                We don&apos;t throw your data away immediately so that you can:
              </p>
              <div className="space-y-3 border-l border-stone-300 pl-4 text-sm leading-relaxed">
                <p>
                  Paste the AI&apos;s reply back into Anonify to instantly swap
                  placeholders (like [PERSON_1]) back into your original data.
                </p>
                <p>
                  Continue a long conversation where &quot;Person 1&quot; always
                  refers to the same individual across multiple prompts.
                </p>
                <p>
                  Switch between different projects or clients without losing
                  your progress.
                </p>
              </div>
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid gap-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)] sm:gap-10">
            <h3 className="text-lg font-semibold text-stone-800">
              When does it disappear?
            </h3>
            <div className="space-y-3 text-stone-600">
              <p className="leading-relaxed">
                Your information is cleared in three ways:
              </p>
              <div className="space-y-3 border-l border-stone-300 pl-4 text-sm leading-relaxed">
                <p>
                  <span className="font-semibold">Session expiry:</span> Every
                  session is set to self-destruct after 24 hours of inactivity.
                </p>
                <p>
                  <span className="font-semibold">Manual wipe:</span> You can
                  click the &quot;Nuclear&quot; button in the app to purge
                  everything from your browser instantly.
                </p>
                <p>
                  <span className="font-semibold">Close the tab:</span> If you
                  use an &quot;Incognito&quot; or &quot;Private&quot; window,
                  the browser wipes the storage the moment you close the tab.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
