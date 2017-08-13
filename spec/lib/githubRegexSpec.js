const matchRepo = imports.lib.githubRegex.matchRepo;

describe('githubRegex', function () {
  describe('matchRepo', function () {
    it('returns true for a valid repo', function () {
      expect(matchRepo("abc/def-ghi_jkl")).toBe(true);
    });

    it('returns false for no slash nor repo', function () {
      expect(matchRepo("abc")).toBeFalsy();
    });

    it('returns false for slash but no repo', function () {
      expect(matchRepo("abc/")).toBeFalsy();
    });

    it('returns false for an empty string', function () {
      expect(matchRepo("")).toBeFalsy();
    });
  });
});
