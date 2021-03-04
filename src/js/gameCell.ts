interface cellInterface {
  size: number,
  content: number
}

let cell = (size: number, content: number) => {
return {
  size,
  content
}
}

export { cellInterface, cell };