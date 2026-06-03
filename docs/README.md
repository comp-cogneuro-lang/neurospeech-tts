# TTS samples — GitHub Pages site

Static showcase of F5-TTS synthesis. Per language: **5 sentences × 6 voices**
plus **20 words per voice**. Driven entirely by [`manifest.json`](manifest.json).

```
docs/
  index.html          # shell
  assets/style.css
  assets/app.js        # builds the page from manifest.json (vanilla JS, no build step)
  manifest.json        # single source of truth: speakers, sentences, words, availability
  samples/
    eu/sentences/s<i>_<spk>.wav
    eu/words/<spk>/<word>.wav
    en/  es/             # empty until you add audio
```

## Preview locally

```bash
cd docs && python3 -m http.server 8000   # http://localhost:8000
```

## Publish on GitHub Pages

Repo **Settings → Pages → Source: "Deploy from a branch" → branch `main`, folder `/docs`**.
Only `docs/samples/**` WAVs are committed (the heavy training dumps are
`.gitignore`d), so the upload stays small.

## Regenerate / add the EU audio

```bash
source .venv-f5/bin/activate
python scripts/build_site_samples.py --lang eu   # resumable; skips existing
```

## Add English / Spanish

The sentence + word text is already in `manifest.json` (placeholders). Two ways
to fill in the audio:

1. **Drop in your own WAVs** using the exact paths the page expects:
   - sentences: `samples/<lang>/sentences/s<i>_<spk>.wav` (`<i>` = 0-based index
     into that language's `sentences`, `<spk>` = `spk0`…`spk5`)
   - words: `samples/<lang>/words/<spk>/<word>.wav` (`<word>` lowercased, spaces
     and `/` → `_`)
2. Or, if you have an EN/ES model wired into `build_site_samples.py`, set
   `"available": true` for that language and run the script.

Then flip `"available": true` for the language in `manifest.json` — the page
swaps the "coming soon" placeholder for the players automatically.
