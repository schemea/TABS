/**
 * Get element bounds ignore transform <br>
 * {@link https://andreiglingeanu.me/nulify-transforms/}
 */
export function getUntransformedBounds(element: HTMLElement) {
    const { top, left, width, height } = element.getBoundingClientRect();

    const t = getComputedStyle(element).transform
        .split(/[(,)]/)
        .slice(1, -1)
        .map(value => parseFloat(value));

    const determinant = t[0] * t[3] - t[1] * t[2];
    return {
        width: width / t[0],
        height: height / t[3],
        left: (left * t[3] - top * t[2] + t[2] * t[5] - t[4] * t[3]) / determinant,
        top: (-left * t[1] + top * t[0] + t[4] * t[1] - t[0] * t[5]) / determinant,
    };
}
