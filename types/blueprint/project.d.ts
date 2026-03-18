/**
 * Blueprint: Project Generator (OLMUI Model)
 *
 * Інтерактивно збирає дані з користувача (Model-as-Schema)
 * і генерує project.md та project.yaml у поточній директорії.
 */
export class ProjectBlueprint extends ProjectModel {
    static UI: {
        title: string;
        description: string;
    };
    /**
     * Run the blueprint interaction flow.
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent>;
}
import { ProjectModel } from '@nan0web/core';
