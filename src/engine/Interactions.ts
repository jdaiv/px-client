import { vec3 } from 'gl-matrix'

export interface IAABB {
    min: vec3
    max: vec3
}

export interface IUsable {
    aabb: IAABB
    text?: string
    hover?: () => any
    click?: () => any
}

export interface IRay {
    origin: vec3
    dir: vec3
    invDir: vec3
}

export default class Interactions {

    public usableItems: IUsable[] = []
    public didClick = false

    public clearItems() {
        this.usableItems.length = 0
    }

    public addItem(i: IUsable) {
        this.usableItems.push(i)
    }

    public run(ray: IRay) {
        let depth = Infinity
        let item: IUsable = null

        this.usableItems.forEach((i) => {

            let tmin = -Infinity
            let tmax = Infinity

            for (let v = 0; v < 3; v++) {
                const t1 = (i.aabb.min[v] - ray.origin[v]) * ray.invDir[v]
                const t2 = (i.aabb.max[v] - ray.origin[v]) * ray.invDir[v]

                tmin = Math.max(tmin, Math.min(t1, t2))
                tmax = Math.min(tmax, Math.max(t1, t2))
            }

            const intersection = tmax > 0 && tmax >= tmin
            if (intersection && tmin < depth) {
                depth = tmin
                item = i
            }
        })

        if (item) {
            if (this.didClick && item.click) {
                item.click()
            }
            if (item.hover) {
                item.hover()
            }
        }
        this.didClick = false
        this.clearItems()
    }

}
