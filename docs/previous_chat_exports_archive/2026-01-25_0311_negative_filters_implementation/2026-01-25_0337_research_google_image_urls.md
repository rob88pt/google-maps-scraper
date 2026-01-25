# Research: Google Maps Image URL Parameters

## Objective
Determine how to transform scraped Google Maps image URLs (low res) into high-resolution versions for full-screen previews.

## Findings

We compared different parameter configurations using a sample image:
Base: `https://lh3.googleusercontent.com/p/AF1QipOfuuA3NNpiC7bRaSTn1e2_rSehp2RKjd57rHWB`

| Parameter         | Description          | Size (Bytes) | Result                             |
| ----------------- | -------------------- | ------------ | ---------------------------------- |
| `=w400-h300-k-no` | Scraper default      | ~15 KB       | Low Res (Thumbnail)                |
| `(no params)`     | Default              | ~31 KB       | Medium Res                         |
| `=s973-k-no`      | User Example         | ~61 KB       | Large                              |
| **`=s0`**         | **Max / Original**   | **~127 KB**  | **Full Resolution**                |
| `=s2048`          | Specific Large Limit | ~127 KB      | Full Resolution (capped at source) |

## Conclusion
To get the "real-sized" full-resolution image:
1. **Strip** all parameters after the `=` sign in the URL.
2. **Append** `=s0` (or `=s1600`/`=s2048` for a sane limit).

## Implementation Recommendation
In `lead-detail-panel.tsx`, when opening the `Dialog` preview:
```typescript
const getHighResUrl = (url: string) => {
    // Check if it's a google user content URL
    if (url.includes('googleusercontent.com')) {
        const baseUrl = url.split('=')[0];
        return `${baseUrl}=s0`;
    }
    return url;
};
```
Use this transformed URL for the `<img src>` inside the `DialogContent`.
