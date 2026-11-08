import API from "@/api";
import type { SloganSetting } from "@/types/siteSetting";

export class SiteSettingsAPI {
  static async getSlogan(): Promise<SloganSetting | null> {
    const response = await API.get<{ slogan: SloganSetting | null }>("website/site-settings", {
      timeout: 5000,
    });
    return response.data.slogan;
  }
}
