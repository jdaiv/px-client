export default interface IEffect {
    run(params: any): IterableIterator<boolean>
}
