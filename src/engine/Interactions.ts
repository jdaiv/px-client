import { vec3 } from 'gl-matrix'

export interface IAABB {
    min: vec3
    max: vec3
}

type InteractionFunc = (d: any) => any

export interface IUsable {
    aabb: IAABB
    hover?: InteractionFunc
    click?: InteractionFunc
    data?: any
}

export interface IRay {
    origin: vec3
    dir: vec3
    invDir: vec3
}

export default class Interactions {

    private count = 0
    public usableItems: IUsable[] = []
    public didClick = false

    public clearItems() {
        this.count = 0
    }

    public addItem(aabb: IAABB,
                   hover?: InteractionFunc,
                   click?: InteractionFunc,
                   data?: any) {
        let item: IUsable
        if (this.count >= this.usableItems.length) {
            item = {
                aabb
            }
            this.usableItems.push(item)
        } else {
            item = this.usableItems[this.count]
        }

        vec3.copy(item.aabb.min, aabb.min)
        vec3.copy(item.aabb.max, aabb.max)
        item.hover = hover
        item.click = click
        item.data = data

        this.count++
    }

    public run(ray: IRay) {
        let depth = Infinity
        let item: IUsable = null

        for (let i = 0; i < this.count; i++) {
            const usable = this.usableItems[i]
            let tmin = -Infinity
            let tmax = Infinity

            for (let v = 0; v < 3; v++) {
                const t1 = (usable.aabb.min[v] - ray.origin[v]) * ray.invDir[v]
                const t2 = (usable.aabb.max[v] - ray.origin[v]) * ray.invDir[v]

                tmin = Math.max(tmin, Math.min(t1, t2))
                tmax = Math.min(tmax, Math.max(t1, t2))
            }

            const intersection = tmax > 0 && tmax >= tmin
            if (intersection && tmin < depth) {
                depth = tmin
                item = usable
            }
        }

        if (item) {
            if (this.didClick && item.click) {
                item.click(item.data)
            }
            if (item.hover) {
                item.hover(item.data)
            }
        }
        this.didClick = false
        this.clearItems()
    }

}
