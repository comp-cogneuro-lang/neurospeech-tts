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

## Regenerate the audio

```bash
source .venv-f5/bin/activate

# Basque — our fine-tuned F5 (newest checkpoint, char vocab), 24 kHz
python scripts/build_site_samples.py --lang eu

# Spanish — jpgallegoar/F5-Spanish (original F5TTS_Base arch, CC-BY-NC-4.0),
# cross-lingual cloning of the same 6 Basque preset clips -> same voices, ES
python scripts/build_site_samples.py --lang es \
  --ckpt   models/f5_spanish/model_1200000.safetensors \
  --vocab  models/f5_spanish/vocab.txt \
  --model-arch F5TTS_Base

# English — stock F5TTS_v1_Base (English-native), same 6 preset clips
BASE=$(echo ~/.cache/huggingface/hub/models--SWivid--F5-TTS/snapshots/*/F5TTS_v1_Base)
python scripts/build_site_samples.py --lang en \
  --ckpt "$BASE/model_1250000.safetensors" \
  --vocab "$BASE/vocab.txt" \
  --model-arch F5TTS_v1_Base
```

All resumable (existing clips are skipped). The Spanish checkpoint is fetched
from `huggingface.co/jpgallegoar/F5-Spanish` into `models/f5_spanish/`; the
English base is the stock F5-TTS model (auto-downloaded to the HF cache).

## Adding another language

Add a block to `manifest.json` (`sentences`, `words`, `speakers` are shared),
then point `build_site_samples.py --lang <code>` at a model that speaks it.

1. **Drop in your own WAVs** using the exact paths the page expects:
   - sentences: `samples/<lang>/sentences/s<i>_<spk>.wav` (`<i>` = 0-based index
     into that language's `sentences`, `<spk>` = `spk0`…`spk5`)
   - words: `samples/<lang>/words/<spk>/<word>.wav` (`<word>` lowercased, spaces
     and `/` → `_`)
2. Or, if you have an EN/ES model wired into `build_site_samples.py`, set
   `"available": true` for that language and run the script.

Then flip `"available": true` for the language in `manifest.json` — the page
swaps the "coming soon" placeholder for the players automatically.
