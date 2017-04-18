<div class="page-header">
<h1>Ġabra API v2.8.1 <small>Updated 2016-03-07</small></h1>
</div>

<div class="well">
This page is meant for developers who want to access the Ġabra database programmatically, such as from a website or app.
If you just want to search the database normally, you should do so from the [Ġabra website](#{gabraURL}).
</div>

## General

- Base URL: <#{fullBaseURL}>
- Everything should be UTF-8 encoded.
- The API is sensitive to Unicode characters. This means that _h_ will not match _ħ_.
- Input arguments when searching are lower-cased, but results are not completely case-agnostic.
- Searching in wordforms is implicitly a prefix search.
- The order in the search results does not follow the Maltese alphabet correctly — the characters _ċ, ġ, ħ, ż_ are sorted after _z_.
  Also, lemmas beginning with upper-case appear before lower-cased ones.
- All fields are optional unless marked as required.

## Operations

### Search lexemes

This returns the lexeme entries (although it searches in wordforms too by default).

> [/lexemes/search?s=ktibt](#{baseURL}/lexemes/search?s=ktibt)

| Argument | Description                       | Example                                | Notes |
|----------|-----------------------------------|----------------------------------------|-------|
| `s`      | Search query                      | `kiteb`                                |       |
| `l`      | Search in lemmas?                 | `0` or `1` (default)                   | Mininum length 2 |
| `wf`     | Search in wordforms?              | `0` or `1` (default)                   | Mininum length 3; prefix matching only |
| `g`      | Search in gloss?                  | `0` or `1` (default)                   | Mininum length 3 |
| `pos`    | Part of speech                    | `NOUN` (see [here](#{baseURL}/schema)) |       |
| `source` | Source                            | `Ellul2013`                            |       |
| `pending`| Include pending entries?          | `0` (default) or `1`                   |       |
| `page`   | Page number                       | `1` (default), `2`, ...                | &nbsp; |

#### Paging

The results are paged. This works as follows:

- A call will return up to `query.page_size` results (currently 20). The page size does not change.
- To see how many results were actually returned, use `results.length`.
- The total number of results from the database will be given in `query.result_count`. Use this to decide if you need to fetch further pages: `if (data.query.page * data.query.page_size >= query.result_count) {`
- The first page of results is numbered 1. Anything below 1 in the `page` parameter will give you an error (HTTP 400).
- There is no upper limit on the page number, but after the last page you will get back an empty `results` field.

### Load lexeme

Load a lexeme from its ID.

> [/lexemes/5200a366e36f237975000f26](#{baseURL}/lexemes/5200a366e36f237975000f26)

| Argument | Description                           | Example                               |
|----------|---------------------------------------|---------------------------------------|
| `:id`    | Lexeme ID                             | `5200a366e36f237975000f26` (required) |

### Load wordforms

Load the wordforms for a particular lexeme.

> [/lexemes/wordforms/5200a366e36f237975000f26](#{baseURL}/lexemes/wordforms/5200a366e36f237975000f26)

| Argument | Description                           | Example                               |
|----------|---------------------------------------|---------------------------------------|
| `:id`    | Lexeme ID                             | `5200a366e36f237975000f26` (required) |
| `match`  | Limit to surface forms matching substring | `kom`                             |
| `pending`| Include pending entries?          | `0` (default) or `1`                   |       |
| `exclude_sources` | Exclude wordforms from given sources | 'Camilleri2013,Apertium2014'  |
| `sort` | Sort wordforms | `0` or `1` (default) |

### Load related lexemes <small>Since v2.4</small>

Load lexemes which are related to a given lexeme.
Currently this only uses root information, but may be extended to include other relations.
The results are sorted by part of speech and derived form, and will not include the original lexeme.

> [/lexemes/related/5200a366e36f237975000f26](#{baseURL}/lexemes/related/5200a366e36f237975000f26)

| Argument | Description                           | Example                               |
|----------|---------------------------------------|---------------------------------------|
| `:id`    | Lexeme ID                             | `5200a366e36f237975000f26` (required) |

### Search suggest

List variations in spelling (diacritics, character case) of a search term, from lemmas:

> [/lexemes/search_suggest?s=Hareg](#{baseURL}/lexemes/search_suggest?s=Hareg)

| Argument | Description          | Example            |
|----------|----------------------|--------------------|
| `s`      | Search query         | `Hareg` (required) |

### Lemmatise

Similar to `lexemes/search` but also returns matching wordform info.

> [/lexemes/lemmatise?s=ktibniehom](#{baseURL}/lexemes/lemmatise?s=ktibniehom)

| Argument   | Description           | Example                  |
|------------|-----------------------|--------------------------|
| `s`        | Surface form (regex)  | `ktibnie?hom` (required) |

### Search for root

Example:

> [/roots/search?s=k-t-b](#{baseURL}/roots/search?s=k-t-b)

> [/roots/search?c1=k&c3=b](#{baseURL}/roots/search?c1=k&c3=b)

| Argument            | Description                               | Example                                                                         |
|---------------------|-------------------------------------------|---------------------------------------------------------------------------------|
| `s`                 | Search query (regex)                      | `k-t-b`, `s-r-v-j`, `^b-.-[jw]$` (required)                                     |
| `c1`,`c2`,`c3`,`c4` | Radicals at positions 1–4 (overrides `s`) | `għ`                                                                          |
| `r`                 | Search in radicals?                       | `0` or `1` (default)                                                            |
| `l`                 | Search in lemma?                          | `0` or `1` (default)                                                            |
| `g`                 | Search in gloss?                          | `0` or `1` (default)                                                            |
| `t`                 | Root type                                 | `strong`, `geminated`, `weak-initial`, `weak-medial`, `weak-final`, `irregular` |
| `page`              | Page number                               | `1` (default), `2`, ...                                                         |

All radicals should be in lower case.
A dot `.` will also match the digraph `għ`.

The results are paged.

### Load lexemes by root <small>Since v2.5</small>

Load lexemes with a given root.
The results are sorted by part of speech and derived form.

> [/roots/lexemes/k-t-b](#{baseURL}/roots/lexemes/k-t-b)

> [/roots/lexemes/b-r-d/2](#{baseURL}/roots/lexemes/b-r-d/2)

| Argument    | Description      | Example                          |
|-------------|------------------|----------------------------------|
| `:radicals` | Root radicals    | `k-t-b`, `s-r-v-j` (required)    |
| `:variant`  | Root variant     | `1`, `2`, ... (optional)         |

### List all sources <small>Since v2.6</small>

List all sources (from the `sources` collection).

> [/sources/](#{baseURL}/sources/)

### Load source <small>Since v2.4</small>

Load a source from its key.

> [/sources/Falzon2013](#{baseURL}/sources/Falzon2013)

| Argument | Description                           | Example                 |
|----------|---------------------------------------|-------------------------|
| `:key`   | Source key                            | `Falzon2013` (required) |

### Internationalisation (i18n) <small>Since v2.3</small>

You can get English & Maltese names for all the field names and values:

> [/i18n/all?lang=mlt](#{baseURL}/i18n/all?lang=mlt)

| Argument   | Description           | Example                  |
|------------|-----------------------|--------------------------|
| `lang`     | Language              | `eng` (default) or `mlt` |