declare var waitForKeyElements: (
  /**
   * Required: The selector string that specifies the desired element(s).
   */
  selectorTxt: string,
  /**
   * Required: The code to run when elements are
   * found. It is passed a jNode to the matched
   * element.
   */
  actionFunction: (el: HTMLElement) => void,
  /**
   * Optional: If false, will continue to scan for
   * new elements even after the first match is
   * found.
   */
  bWaitOnce?: boolean
) => void;
